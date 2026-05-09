import { errorResponse } from "@/lib/api";

export function GET() {
  return errorResponse(404, "The requested endpoint could not be found.");
}

export function POST() {
  return errorResponse(404, "The requested endpoint could not be found.");
}

export function PUT() {
  return errorResponse(404, "The requested endpoint could not be found.");
}

export function PATCH() {
  return errorResponse(404, "The requested endpoint could not be found.");
}

export function DELETE() {
  return errorResponse(404, "The requested endpoint could not be found.");
}
