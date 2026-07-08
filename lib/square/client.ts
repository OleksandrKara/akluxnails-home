import { SquareClient, SquareEnvironment } from "square";

// One shared SDK client instance, mirroring salonLandings' pattern (backend/app/integrations/
// square/client.py: a single cached client, env-driven token/environment, injected into a thin
// gateway per concern). This app talks to the *same* production Square account independently —
// no shared code/process with salonLandings' own backend, so a bug here can never affect mani.
declare global {
  var __squareClient: SquareClient | undefined;
}

export function getSquareClient(): SquareClient {
  if (!global.__squareClient) {
    const environment = process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? SquareEnvironment.Sandbox
      : SquareEnvironment.Production;
    global.__squareClient = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment,
    });
  }
  return global.__squareClient;
}

export function locationId(): string {
  const id = process.env.SQUARE_LOCATION_ID;
  if (!id) throw new Error("SQUARE_LOCATION_ID is not configured");
  return id;
}
