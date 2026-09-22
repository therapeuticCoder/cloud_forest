import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { Care } from "@/types/care";
import type { MyCareTab } from "./MyCareView";

type CareDestination =
  | { kind: "detail"; careId: string }
  | { kind: "claim"; care: Care }
  | {
      kind: "my-care";
      initialTab?: MyCareTab;
    };

export function useCareNavigation(
  setChromeHidden: Dispatch<SetStateAction<boolean>>,
) {
  const [careDestination, setCareDestination] =
    useState<CareDestination | null>(null);
  const careReturnFocusSelectorRef = useRef<string | null>(null);
  const careReturnScrollYRef = useRef(0);
  const ignoreNextCarePopStateRef = useRef(false);
  const openCareDestination = (
    destination: CareDestination,
    returnFocusSelector: string,
  ) => {
    careReturnFocusSelectorRef.current = returnFocusSelector;
    careReturnScrollYRef.current = window.scrollY;
    window.history.pushState(
      { ...window.history.state, careDestination: destination.kind },
      "",
    );
    setCareDestination(destination);
  };

  const restoreFromCareDestination = useCallback(
    (focusSelector = careReturnFocusSelectorRef.current) => {
      careReturnFocusSelectorRef.current = null;
      setChromeHidden(false);
      setCareDestination(null);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, careReturnScrollYRef.current);
          if (focusSelector) {
            document.querySelector<HTMLElement>(focusSelector)?.focus();
          }
        });
      });
    },
    [setChromeHidden],
  );

  const rewindCareHistory = useCallback(() => {
    ignoreNextCarePopStateRef.current = true;
    window.history.back();
    window.setTimeout(() => {
      window.scrollTo(0, careReturnScrollYRef.current);
      ignoreNextCarePopStateRef.current = false;
    }, 100);
  }, []);

  const backFromCareDestination = useCallback(() => {
    restoreFromCareDestination(careReturnFocusSelectorRef.current);
    rewindCareHistory();
  }, [restoreFromCareDestination, rewindCareHistory]);

  useEffect(() => {
    if (!careDestination) return;

    const handlePopState = () => {
      if (ignoreNextCarePopStateRef.current) {
        ignoreNextCarePopStateRef.current = false;
        return;
      }
      restoreFromCareDestination(careReturnFocusSelectorRef.current);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") backFromCareDestination();
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [backFromCareDestination, careDestination, restoreFromCareDestination]);

  return {
    careDestination,
    openCareDestination,
    restoreFromCareDestination,
    rewindCareHistory,
    backFromCareDestination,
  };
}
