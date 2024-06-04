defmodule TimeManagerApiWeb.PageController do
  use TimeManagerApiWeb, :controller

  def home(conn, _params) do
    # The home page is often custom made,
    # so skip the default app layout.
    conn
    |> put_resp_header("content-type", "application/json")
    |> send_resp(:bad_request, '{"message": "Invalid endpoint"}')
  end
end
