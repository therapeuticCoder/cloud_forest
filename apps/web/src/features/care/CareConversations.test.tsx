import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Care } from "@/types/care";
import type { CuratorPerson } from "@/types/curator";
import { CuratorDetailView } from "../curator/CuratorDetailView";
import { MyCareView } from "./MyCareView";
import { CareDetailView } from "./CareDetailView";
import { CareConversations, CareConversationEntry } from "./CareConversations";
import type { CareConversationClient } from "./careConversationClient";

const baseCare: Care = {
  id: "care-a",
  direction: "give",
  category: "food",
  subtype: "A warm meal",
  days: [],
  times: [],
  timeNote: "",
  location: "Nearby",
  requirements: "",
  sensitivities: "",
  audience: "Party",
  status: "claimed",
  conversationAvailable: true,
  createdAt: "2026-10-01T12:00:00Z",
  originator: { id: "empty-person", displayName: "Empty Tester" },
  participant: { id: "river-person", displayName: "River Tester" },
};
function client(): CareConversationClient {
  return {
    getCareUnread: vi.fn().mockResolvedValue({
      ok: false,
      kind: "network",
      cause: new Error("Unread unavailable"),
    }),
    getCareMessages: vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      value: { apiVersion: "v1", data: { messages: [] } },
    }),
    sendCareMessage: vi
      .fn()
      .mockResolvedValue({ ok: true, status: 204, value: null }),
    markCareMessagesRead: vi
      .fn()
      .mockResolvedValue({ ok: true, status: 204, value: null }),
  };
}
function surface(name: string, care: Care, viewerId: string) {
  if (name === "Timeline detail")
    return <CareDetailView care={care} viewerId={viewerId} onBack={vi.fn()} />;
  if (name === "My Care")
    return (
      <MyCareView
        cares={[care]}
        viewerId={viewerId}
        viewerDisplayName="Tester"
        onBack={vi.fn()}
        initialTab={
          (care.originator.id === viewerId) === (care.direction === "give")
            ? "give"
            : "receive"
        }
        isAdmin={false}
        onCreateSignupCode={vi.fn()}
        onSignOut={vi.fn()}
        signingOut={false}
      />
    );
  const partner =
    care.originator.id === viewerId ? care.participant! : care.originator;
  const person: CuratorPerson = {
    id: "character-partner",
    displayName: partner.displayName,
    initials: "CT",
    relationshipTitle: "Friend",
    relationshipNote: "",
    recentStatus: "",
    placement: "party",
    relationshipState: "connected",
    linkedPersonId: partner.id,
    version: 1,
  };
  return (
    <CuratorDetailView
      activeCares={[care]}
      viewerId={viewerId}
      selection={{ layer: "party", item: person }}
      currentPerson={person}
      characterSubmission={{ pending: false }}
      isOffline={false}
      onBack={vi.fn()}
      onBackToLayer={vi.fn()}
      onBlockCharacter={vi.fn()}
      onDeleteCharacter={vi.fn()}
      onEndConnection={vi.fn()}
      onUnblockCharacter={vi.fn()}
      onCommitToCare={vi.fn()}
      onPass={vi.fn()}
      onRecordCompleted={vi.fn()}
      onRecordNotCompleted={vi.fn()}
      onStartConnection={vi.fn()}
      onUpdateCharacter={vi.fn()}
      onWithdraw={vi.fn()}
    />
  );
}
afterEach(() => {
  vi.restoreAllMocks();
});

describe("Care conversations", () => {
  for (const name of ["Party detail", "My Care", "Timeline detail"])
    for (const direction of ["give", "receive"] as const)
      for (const viewerId of ["empty-person", "river-person"]) {
        it(`${name}: ${direction}, ${viewerId} can enter even when unread polling fails`, async () => {
          const care = { ...baseCare, direction };
          const api = client();
          render(
            <CareConversations
              cares={[care]}
              ownerId={viewerId}
              enabled
              onRefreshCares={vi.fn()}
              client={api}
            >
              {surface(name, care, viewerId)}
            </CareConversations>,
          );
          await userEvent.click(
            screen.getByRole("button", { name: "Conversation" }),
          );
          expect(
            await screen.findByRole("dialog", { name: "Care conversation" }),
          ).toBeInTheDocument();
          await waitFor(() =>
            expect(api.getCareMessages).toHaveBeenCalledWith({
              careId: care.id,
            }),
          );
          expect(screen.getByRole("dialog")).not.toHaveTextContent(
            "A warm meal",
          );
        });
      }

  it("keeps a partially completed conversation, and removes entry and screen when terminal", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    vi.spyOn(window.history, "back").mockImplementation(() =>
      window.dispatchEvent(new PopStateEvent("popstate")),
    );
    const api = client();
    const partial = {
      ...baseCare,
      originatorCompletedAt: "2026-10-01T12:05:00Z",
    };
    const view = (care: Care) => (
      <CareConversations
        cares={[care]}
        ownerId="river-person"
        enabled
        onRefreshCares={vi.fn()}
        client={api}
      >
        <CareConversationEntry care={care} />
      </CareConversations>
    );
    const rendered = render(view(partial));
    await userEvent.click(screen.getByRole("button", { name: "Conversation" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    rendered.rerender(
      view({ ...partial, status: "completed", conversationAvailable: false }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Conversation" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/conversation ended/i)).not.toBeInTheDocument();
  });

  it("Back consumes only the conversation history step and restores its source focus and scroll", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    vi.spyOn(window.history, "back").mockImplementation(() =>
      window.dispatchEvent(new PopStateEvent("popstate")),
    );
    const underlyingPop = vi.fn();
    window.addEventListener("popstate", underlyingPop);
    try {
      render(
        <CareConversations
          cares={[baseCare]}
          ownerId="river-person"
          enabled
          onRefreshCares={vi.fn()}
          client={client()}
        >
          <section className="care-destination">
            <CareConversationEntry care={baseCare} />
            <p>Source view</p>
          </section>
        </CareConversations>,
      );
      const entry = screen.getByRole("button", { name: "Conversation" });
      const source = entry.closest<HTMLElement>(".care-destination")!;
      source.scrollTop = 150;
      await userEvent.click(entry);
      await userEvent.click(screen.getByRole("button", { name: "Back" }));
      await waitFor(() => expect(entry).toHaveFocus());
      expect(source.scrollTop).toBe(150);
      expect(underlyingPop).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener("popstate", underlyingPop);
    }
  });

  it("keeps unsent text on send failure and sends no requests while offline", async () => {
    const api = client();
    vi.mocked(api.sendCareMessage).mockResolvedValue({
      ok: false,
      kind: "network",
      cause: new Error("Offline"),
    });
    const view = (enabled: boolean) => (
      <CareConversations
        cares={[baseCare]}
        ownerId="river-person"
        enabled={enabled}
        onRefreshCares={vi.fn()}
        client={api}
      >
        <CareConversationEntry care={baseCare} />
      </CareConversations>
    );
    const rendered = render(view(true));
    await userEvent.click(screen.getByRole("button", { name: "Conversation" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("No messages yet"),
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Message" }),
      "My unsent message",
    );
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "unsent message is still here",
    );
    expect(screen.getByRole("textbox")).toHaveValue("My unsent message");
    rendered.rerender(view(false));
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    expect(api.sendCareMessage).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("textbox")).toHaveAttribute("maxlength", "2000");
  });

  it("only renders entry points allowed by current server Care eligibility", () => {
    const unavailable = { ...baseCare, conversationAvailable: false };
    render(
      <CareConversations
        cares={[unavailable]}
        ownerId="river-person"
        enabled
        onRefreshCares={vi.fn()}
        client={client()}
      >
        <CareConversationEntry care={unavailable} />
      </CareConversations>,
    );
    expect(
      screen.queryByRole("button", { name: "Conversation" }),
    ).not.toBeInTheDocument();
  });
});
