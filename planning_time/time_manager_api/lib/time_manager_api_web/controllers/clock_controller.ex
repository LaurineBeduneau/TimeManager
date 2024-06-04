defmodule TimeManagerApiWeb.ClockController do
  use TimeManagerApiWeb, :controller

  alias TimeManagerApi.Clocks
  alias TimeManagerApi.Clocks.Clock
  alias TimeManagerApi.Accounts
  alias TimeManagerApi.Guardian
  alias TimeManagerApi.Workingtimes

  action_fallback(TimeManagerApiWeb.FallbackController)

  def index(conn, _params) do
    clocks = Clocks.list_clocks()
    render(conn, :index, clocks: clocks)
  end

  def create(conn, %{"clock" => clock_params, "user_id" => user_id}) do
    clock_params = Map.put(clock_params, "user_id", user_id)

    with {:ok, %Clock{} = clock} <- Clocks.create_clock(clock_params) do
      conn
      |> put_status(:created)
      |> render(:show, clock: clock)
    end
  end

  def show(conn, %{"id" => id}) do
    clock = Clocks.get_clock!(id)
    render(conn, :show, clock: clock)
  end

  def update(conn, %{"id" => id, "clock" => clock_params}) do
    clock = Clocks.get_clock!(id)

    with {:ok, %Clock{} = clock} <- Clocks.update_clock(clock, clock_params) do
      render(conn, :show, clock: clock)
    end
  end

  def delete(conn, %{"id" => id}) do
    clock = Clocks.get_clock!(id)

    with {:ok, %Clock{}} <- Clocks.delete_clock(clock) do
      send_resp(conn, :no_content, "")
    end
  end

  def getClocksUserId(conn, %{}) do
    jwt =
      conn |> get_req_header("authorization") |> List.first() |> String.split(" ") |> List.last()

    {:ok, claims} = Guardian.decode_and_verify(jwt)
    user_id = claims["sub"]

    userExists = Accounts.get_user!(user_id)

    if !userExists do
      send_resp(conn, :bad_request, "")
    else
      clocks = Clocks.list_clocks_by_user(user_id)
      render(conn, :index, clocks: clocks)
    end
  end

  def setClocksForUser(conn, %{}) do
    jwt =
      conn |> get_req_header("authorization") |> List.first() |> String.split(" ") |> List.last()

    {:ok, claims} = Guardian.decode_and_verify(jwt)
    user_id = String.to_integer(claims["sub"])

    current_clocks = Clocks.list_clocks_by_user(user_id)

    current_clocks =
      Enum.filter(current_clocks, fn c -> c.status == true && c.user_id == user_id end)

    if length(current_clocks) == 0 do
      with {:ok, %Clock{} = c} <-
             Clocks.create_clock(%{
               "user_id" => user_id,
               "time" => DateTime.to_iso8601(DateTime.utc_now()),
               "status" => true
             }) do
        conn
        |> put_status(:created)
        |> render(:show, clock: c)
      end
    else
      first_clock = Enum.at(current_clocks, 0)
      Clocks.update_clock(first_clock, %{"status" => false})

      Workingtimes.create_workingtime(%{
        "user_id" => user_id,
        "start" => DateTime.to_iso8601(first_clock.time),
        "end" => DateTime.to_iso8601(DateTime.utc_now())
      })

      send_resp(conn, :ok, "")
    end
  end

  def getLatestClock(conn, %{}) do
    jwt =
      conn |> get_req_header("authorization") |> List.first() |> String.split(" ") |> List.last()

    {:ok, claims} = Guardian.decode_and_verify(jwt)
    user_id = claims["sub"]

    userExists = Accounts.get_user!(user_id)

    if !userExists do
      send_resp(conn, :bad_request, "")
    else
      clocks = Clocks.list_clocks_by_user(user_id)

      if length(clocks) == 0 do
        send_resp(conn, :not_found, "")
      else
        clock = Enum.sort_by(clocks, & &1.time) |> Enum.reverse() |> List.first()
        render(conn, :show, clock: clock)
      end
    end
  end
end
