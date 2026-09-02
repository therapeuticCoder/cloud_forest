export type ReceiveCareRequest = {
  id: string;
  kind: "meal";
  need: "A meal";
  helpfulWhen: string;
  foodWorks: string;
  foodDoesNotWork: string;
  handoffStyle: string;
  audience: "Party";
  status: "open";
  createdAt: string;
};
