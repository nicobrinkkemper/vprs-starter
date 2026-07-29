/** Types for handler.mjs, which stays plain ESM so `node edge-server.mjs` can run it directly. */
export declare const handler: (request: Request) => Promise<Response>;
export declare const renderHook: (
  route: string,
  request: Request
) => Promise<Response | null>;
export declare const action:
  | ((request: Request, opts?: { projectRoot?: string }) => Promise<Response>)
  | undefined;
