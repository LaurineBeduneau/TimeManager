defmodule TimeManagerApiWeb.UserController do
  use TimeManagerApiWeb, :controller

  alias TimeManagerApi.Accounts
  alias TimeManagerApi.Accounts.User
  alias TimeManagerApi.Guardian
  alias TimeManagerApi.Repo

  action_fallback(TimeManagerApiWeb.FallbackController)

  def index(conn, _params) do
    users = Accounts.list_users()

    # load teams for each user
    users =
      for user <- users do
        user = Repo.preload(user, :teams_members)
        user = Repo.preload(user, :teams)
        user
      end

    render(conn, :index, users: users)
  end

  def create(conn, %{"user" => user_params}) do
    with {:ok, %User{} = user} <- Accounts.create_user(user_params),
         {:ok, token, _claims} <- Guardian.encode_and_sign(user) do
      conn |> render(:showWithJWT, jwt: token)
    else
      {:error, %Ecto.Changeset{} = changeset} ->
        errors_list =
          Enum.map(changeset.errors, fn {field, {message, opts}} ->
            formatted_message =
              Enum.reduce(opts, message, fn {key, value}, acc ->
                String.replace(acc, "%{#{key}}", to_string(value))
              end)

            "#{field} - #{formatted_message}"
          end)

        conn
        |> put_status(:unprocessable_entity)
        |> render(:errors, errors: errors_list)
    end
  end

  def show(conn, %{"id" => id}) do
    user = Accounts.get_user!(id)
    # load teams
    user = Repo.preload(user, :teams_members)
    user = Repo.preload(user, :teams)

    render(conn, :show, user: user)
  end

  def show(conn, %{}) do
    jwt =
      conn |> get_req_header("authorization") |> List.first() |> String.split(" ") |> List.last()

    case Guardian.decode_and_verify(jwt) do
      {:ok, claims} ->
        IO.puts("claims: #{inspect(claims)}")

        try do
          user = Accounts.get_user!(claims["sub"])
          # load teams
          user = Repo.preload(user, :teams_members)
          user = Repo.preload(user, :teams)

          render(conn, :show, user: user)
        rescue
          _ -> conn |> send_resp(401, "Your token is invalid") |> halt()
        end

      {:error, _reason} ->
        conn
        |> send_resp(401, "Your token is invalid")
        |> halt()
    end
  end

  def update(conn, %{"id" => id, "user" => user_params}) do
    user = Accounts.get_user!(id)
    user = Repo.preload(user, :teams)

    with {:ok, %User{} = user} <- Accounts.update_user_admin(user, user_params) do
      render(conn, :show, user: user)
    else
      {:error, %Ecto.Changeset{} = changeset} ->
        errors_list =
          Enum.map(changeset.errors, fn {field, {message, opts}} ->
            formatted_message =
              Enum.reduce(opts, message, fn {key, value}, acc ->
                String.replace(acc, "%{#{key}}", to_string(value))
              end)

            "#{field} - #{formatted_message}"
          end)

        conn
        |> put_status(:unprocessable_entity)
        |> render(:errors, errors: errors_list)
    end
  end

  def update(conn, %{"user" => user_params}) do
    jwt =
      conn |> get_req_header("authorization") |> List.first() |> String.split(" ") |> List.last()

    case Guardian.decode_and_verify(jwt) do
      {:ok, claims} ->
        IO.puts("claims: #{inspect(claims)}")
        user = Accounts.get_user!(claims["sub"])
        user = Repo.preload(user, :teams)
        user_password = user_params["password"]

        # Check if user_password is the same as the one in the database
        if Comeonin.Bcrypt.checkpw(user_password, user.password_hash) do
          # Remove password from params
          IO.puts("user_params : #{inspect(user_params)}")

          # Update password only if new_password is not empty
          user_params =
            Map.update!(user_params, "password", fn _ ->
              (user_params["new_password"] != "" && user_params["new_password"]) || user_password
            end)

          with {:ok, %User{} = user} <- Accounts.update_user(user, user_params) do
            render(conn, :show, user: user)
          else
            {:error, %Ecto.Changeset{} = changeset} ->
              errors_list =
                Enum.map(changeset.errors, fn {field, {message, opts}} ->
                  formatted_message =
                    Enum.reduce(opts, message, fn {key, value}, acc ->
                      String.replace(acc, "%{#{key}}", to_string(value))
                    end)

                  "#{field} - #{formatted_message}"
                end)

              conn
              |> put_status(:unprocessable_entity)
              |> render(:errors, errors: errors_list)
          end
        else
          conn
          |> put_status(:unprocessable_entity)
          |> render(:errors, errors: ["password - Password is incorrect"])
        end

      {:error, _reason} ->
        conn
        |> send_resp(401, "Your token is invalid")
        |> halt()
    end
  end

  def delete(conn, %{"id" => id}) do
    user = Accounts.get_user!(id)

    with {:ok, %User{}} <- Accounts.delete_user(user) do
      send_resp(conn, :no_content, "")
    end
  end

  def deleteMyAccount(conn, %{}) do
    jwt =
      conn |> get_req_header("authorization") |> List.first() |> String.split(" ") |> List.last()

    case Guardian.decode_and_verify(jwt) do
      {:ok, claims} ->
        IO.puts("claims: #{inspect(claims)}")
        user = Accounts.get_user!(claims["sub"])

        with {:ok, %User{}} <- Accounts.delete_user(user) do
          send_resp(conn, :no_content, "")
        end

      {:error, _reason} ->
        conn
        |> send_resp(401, "Your token is invalid")
        |> halt()
    end
  end

  def getusers(conn, %{"email" => email, "username" => username} = _params) do
    user = Accounts.get_user_by_username_or_email(username, email)
    render(conn, :show, user: user)
  end

  def login(conn, %{"user" => user_params}) do
    email = user_params["email"]
    password = user_params["password"]

    case Accounts.token_sign_in(email, password) do
      {:ok, token, _claims} ->
        conn |> render(:showWithJWT, jwt: token)

      _ ->
        {:error, :unauthorized}
    end
  end

  def isAdmin(conn, _params) do
    conn
    |> put_status(:ok)
    |> text("You are an admin")
  end

  def getOneByUsername(conn, %{"username" => username}) do
    jwt =
      conn |> get_req_header("authorization") |> List.first() |> String.split(" ") |> List.last()

    case Guardian.decode_and_verify(jwt) do
      {:ok, claims} ->
        role = claims["role"]

        if role == "admin" or role == "manager" do
          user = Accounts.get_user_by_username(username)
          user = Repo.preload(user, :teams_members)
          user = Repo.preload(user, :teams)

          if user == nil do
            conn
            |> put_status(:not_found)
            |> send_resp(:not_found, "User not found")
          else
            render(conn, :show, user: user)
          end
        else
          conn
          |> put_status(:unauthorized)
          |> send_resp(:unauthorized, "You are not authorized to do this action")
        end

      {:error, _reason} ->
        conn
        |> send_resp(401, "Your token is invalid")
        |> halt()
    end
  end
end
