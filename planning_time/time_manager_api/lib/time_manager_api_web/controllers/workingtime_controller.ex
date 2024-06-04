defmodule TimeManagerApiWeb.WorkingtimeController do
  use TimeManagerApiWeb, :controller

  alias TimeManagerApi.Workingtimes
  alias TimeManagerApi.Workingtimes.Workingtime
  alias TimeManagerApi.Accounts
  alias TimeManagerApi.Guardian

  action_fallback(TimeManagerApiWeb.FallbackController)

  def getOne(conn, %{"userId" => userId, "id" => id}) do
    try do
      user_exists = Accounts.user_exists?(userId)

      if !user_exists do
        conn
        |> put_resp_header("content-type", "application/json")
        |> send_resp(:not_found, ~c"{\"message\": \"User not found\"}")
      else
        workingtime = Workingtimes.get_workingtime_by_user_id_and_id!(userId, id)

        conn
        |> put_status(:ok)
        |> render(:show, workingtime: workingtime)
      end
    rescue
      type in Ecto.NoResultsError ->
        conn
        |> put_resp_header("content-type", "application/json")
        |> send_resp(:not_found, ~c"{\"message\": \"Workingtime not found\"}")
    end
  end

  def getAll(conn, %{} = params) do
    jwt =
      conn |> get_req_header("authorization") |> List.first() |> String.split(" ") |> List.last()

    case Guardian.decode_and_verify(jwt) do
      {:ok, claims} ->
        userId = claims["sub"]

        start_time = Map.get(params, "start", nil)
        end_time = Map.get(params, "end", nil)

        try do
          workingtimes = Workingtimes.list_workingtimes_by_user_id!(userId)

          filtered_working_times =
            if start_time && end_time do
              {:ok, parsed_start_time, 0} = DateTime.from_iso8601(start_time)
              {:ok, parsed_end_time, 0} = DateTime.from_iso8601(end_time)

              Enum.filter(workingtimes, fn workingtime ->
                DateTime.compare(workingtime.start, parsed_start_time) in [:eq, :gt] &&
                  DateTime.compare(workingtime.end, parsed_end_time) in [:eq, :lt]
              end)
            else
              workingtimes
            end

          conn
          |> put_status(:ok)
          |> render(:index, workingtimes: filtered_working_times)
        rescue
          type in Ecto.NoResultsError ->
            conn
            |> put_resp_header("content-type", "application/json")
            |> send_resp(:not_found, ~c"{\"message\": \"User not found\"}")
        end

      {:error, _reason} ->
        conn
        |> send_resp(401, "Your token is invalid")
        |> halt()
    end
  end

  def getAllFromUser(conn, %{"userId" => userId}) do
    jwt =
      conn |> get_req_header("authorization") |> List.first() |> String.split(" ") |> List.last()

    case Guardian.decode_and_verify(jwt) do
      {:ok, claims} ->
        requestUserId = claims["sub"]
        role = claims["role"]

        if requestUserId == userId || role == "admin" or role == "manager" do
          try do
            user_exists = Accounts.user_exists?(userId)

            if !user_exists do
              conn
              |> put_resp_header("content-type", "application/json")
              |> send_resp(:not_found, ~c"{\"message\": \"User not found\"}")
            else
              workingtimes = Workingtimes.list_workingtimes_by_user_id!(userId)

              conn
              |> put_status(:ok)
              |> render(:index, workingtimes: workingtimes)
            end
          rescue
            type in Ecto.NoResultsError ->
              conn
              |> put_resp_header("content-type", "application/json")
              |> send_resp(:not_found, ~c"{\"message\": \"User not found\"}")
          end
        else
          conn
          |> send_resp(401, "You are not allowed to see this user's workingtimes")
          |> halt()
        end

      {:error, _reason} ->
        conn
        |> send_resp(401, "Your token is invalid")
        |> halt()
    end
  end

  def create(conn, %{"userId" => userId, "workingtime" => workingtime_params}) do
    try do
      workingtime_params = Map.put(workingtime_params, "user_id", userId)

      with {:ok, %Workingtime{} = workingtime} <-
             Workingtimes.create_workingtime(workingtime_params) do
        conn
        |> put_status(:created)
        |> render(:show, workingtime: workingtime)
      else
        {:error, %Ecto.Changeset{} = changeset} ->
          conn
          |> put_resp_header("content-type", "application/json")
          |> send_resp(:unprocessable_entity, ~c"{\"message\": \"Invalid workingtime\"}")
      end
    rescue
      e in Ecto.ConstraintError ->
        conn
        |> put_resp_header("content-type", "application/json")
        |> send_resp(:bad_request, ~c"{\"message\": \"User not found\"}")
    end
  end

  def update(conn, %{"id" => id, "workingtime" => workingtime_params}) do
    try do
      workingtime = Workingtimes.get_workingtime!(id)

      with {:ok, %Workingtime{} = workingtime} <-
             Workingtimes.update_workingtime(workingtime, workingtime_params) do
        render(conn, :show, workingtime: workingtime)
      else
        {:error, %Ecto.Changeset{} = changeset} ->
          conn
          |> put_resp_header("content-type", "application/json")
          |> send_resp(:unprocessable_entity, ~c"{\"message\": \"Invalid workingtime\"}")
      end
    rescue
      e ->
        conn
        |> put_resp_header("content-type", "application/json")
        |> send_resp(:bad_request, ~c"{\"message\": \"Workingtime not found\"}")
    end
  end

  def delete(conn, %{"id" => id}) do
    workingtime = Workingtimes.get_workingtime!(id)

    with {:ok, %Workingtime{}} <- Workingtimes.delete_workingtime(workingtime) do
      send_resp(conn, :no_content, "")
    end
  end
end
