defmodule TimeManagerApiWeb.TeamController do
  use TimeManagerApiWeb, :controller

  alias TimeManagerApi.Teams
  alias TimeManagerApi.Teams.Team
  alias TimeManagerApi.Repo
  alias TimeManagerApi.Accounts
  alias TimeManagerApi.Accounts.User
  alias TimeManagerApi.Guardian
  alias TimeManagerApi.Teams.TeamsMembers

  action_fallback(TimeManagerApiWeb.FallbackController)

  def index(conn, _params) do
    teams = Teams.list_teams()
    # for all team get the members count
    teams =
      for team <- teams do
        team = Repo.preload(team, :teams_members)
        team = Repo.preload(team, :users)
        team
      end

    render(conn, :index, teams: teams)
  end

  def create(conn, %{"team" => team_params}) do
    with {:ok, %Team{} = team} <- Teams.create_team(team_params) do
      team = Repo.preload(team, :users)
      team = Repo.preload(team, :teams_members)

      # Get the user from the token
      jwt =
        conn
        |> get_req_header("authorization")
        |> List.first()
        |> String.split(" ")
        |> List.last()

      case Guardian.decode_and_verify(jwt) do
        {:ok, claims} ->
          # user
          user = Accounts.get_user!(claims["sub"])
          team_added = Teams.add_user_to_team(team, user.id)

        {:error, _reason} ->
          conn
          |> send_resp(401, "Your token is invalid")
          |> halt()
      end

      conn
      |> put_status(:created)
      |> render(:show, team: team)
    end
  end

  def show(conn, %{"id" => id}) do
    jwt =
      conn |> get_req_header("authorization") |> List.first() |> String.split(" ") |> List.last()

    case Guardian.decode_and_verify(jwt) do
      {:ok, claims} ->
        role = claims["role"]
        # user
        user = Accounts.get_user!(claims["sub"])
        team = Teams.get_team!(id) |> Repo.preload(:teams_members) |> Repo.preload(:users)

        # check if user is in the team or role is admin
        if Enum.any?(team.teams_members, fn tm -> tm.user_id == user.id end) or role == "admin" do
          render(conn, :show, team: team)
        else
          conn
          |> send_resp(401, "You are not in this team")
          |> halt()
        end

      {:error, _reason} ->
        conn
        |> send_resp(401, "Your token is invalid")
        |> halt()
    end
  end

  def update(conn, %{"id" => id, "team" => team_params}) do
    team = Teams.get_team!(id)
    team = Repo.preload(team, :users)
    team = Repo.preload(team, :teams_members)

    # Get the user from the token
    jwt =
      conn
      |> get_req_header("authorization")
      |> List.first()
      |> String.split(" ")
      |> List.last()

    case Guardian.decode_and_verify(jwt) do
      {:ok, claims} ->
        # user
        user = Accounts.get_user!(claims["sub"])

        # check if user is in the team or role is admin
        if (Enum.any?(team.teams_members, fn tm -> tm.user_id == user.id end) and
              claims["role"] == "manager") or claims["role"] == "admin" do
          with {:ok, %Team{} = team} <- Teams.update_team(team, team_params) do
            render(conn, :show, team: team)
          end
        else
          conn
          |> send_resp(401, "You are not in this team")
          |> halt()
        end

      {:error, _reason} ->
        conn
        |> send_resp(401, "Your token is invalid")
        |> halt()
    end
  end

  def delete(conn, %{"id" => id}) do
    team = Teams.get_team!(id)
    team = Repo.preload(team, :teams_members)
    team = Repo.preload(team, :users)

    # Get the user from the token
    jwt =
      conn
      |> get_req_header("authorization")
      |> List.first()
      |> String.split(" ")
      |> List.last()

    case Guardian.decode_and_verify(jwt) do
      {:ok, claims} ->
        # user
        user = Accounts.get_user!(claims["sub"])

        # check if user is in the team or role is admin
        if (Enum.any?(team.teams_members, fn tm -> tm.user_id == user.id end) and
              claims["role"] == "manager") or
             claims["role"] == "admin" do
          with {:ok, %Team{}} <- Teams.delete_team(team) do
            send_resp(conn, :no_content, "")
          end
        else
          conn
          |> send_resp(401, "You are not in this team")
          |> halt()
        end

      {:error, _reason} ->
        conn
        |> send_resp(401, "Your token is invalid")
        |> halt()
    end
  end

  def getMyTeams(conn, %{}) do
    jwt =
      conn |> get_req_header("authorization") |> List.first() |> String.split(" ") |> List.last()

    case Guardian.decode_and_verify(jwt) do
      {:ok, claims} ->
        teams = Teams.get_teams_of_user(claims["sub"])
        # for all team get the members count
        teams =
          for team <- teams do
            team = Repo.preload(team, :teams_members)
            team = Repo.preload(team, :users)
            team
          end

        render(conn, :index, teams: teams)

      {:error, _reason} ->
        conn
        |> send_resp(401, "Your token is invalid")
        |> halt()
    end
  end

  def addUser(conn, %{"id" => id, "user" => user_params}) do
    try do
      team = Teams.get_team!(id)
      team = Repo.preload(team, :teams_members)
      team = Repo.preload(team, :users)

      # Get the user from the token
      jwt =
        conn
        |> get_req_header("authorization")
        |> List.first()
        |> String.split(" ")
        |> List.last()

      case Guardian.decode_and_verify(jwt) do
        {:ok, claims} ->
          # user
          user = Accounts.get_user!(claims["sub"])

          # check if user is in the team or role is admin
          if (Enum.any?(team.teams_members, fn tm -> tm.user_id == user.id end) and
                claims["role"] == "manager") or claims["role"] == "admin" do
            user = Accounts.get_user!(user_params["user_id"])
            team_added = Teams.add_user_to_team(team, user.id)

            # return success with empty body
            conn
            |> send_resp(:created, "")
          else
            conn
            |> send_resp(401, "You are not in this team")
            |> halt()
          end

        {:error, _reason} ->
          conn
          |> send_resp(401, "Your token is invalid")
          |> halt()
      end
    rescue
      _ ->
        conn
        |> send_resp(400, "Can't add user to the team")
    end
  end

  def removeUser(conn, %{"id" => id, "user" => user_params}) do
    try do
      team = Teams.get_team!(id)
      team = Repo.preload(team, :teams_members)
      team = Repo.preload(team, :users)

      # Get the user from the token
      jwt =
        conn
        |> get_req_header("authorization")
        |> List.first()
        |> String.split(" ")
        |> List.last()

      case Guardian.decode_and_verify(jwt) do
        {:ok, claims} ->
          # user
          user = Accounts.get_user!(claims["sub"])

          # check if user is in the team or role is admin
          if (Enum.any?(team.teams_members, fn tm -> tm.user_id == user.id end) and
                claims["role"] == "manager") or claims["role"] == "admin" do
            user = Accounts.get_user!(user_params["user_id"])
            team_added = Teams.remove_user_from_team(team, user.id)

            # return success with empty body
            conn
            |> send_resp(200, "")
          else
            conn
            |> send_resp(401, "You are not in this team")
            |> halt()
          end

        {:error, _reason} ->
          conn
          |> send_resp(401, "Your token is invalid")
          |> halt()
      end
    rescue
      e ->
        conn
        |> send_resp(400, "Can't remove user from the team")
    end
  end

  def getTeamUsers(conn, %{"id" => id}) do
    # Get into table teams_members all the users id of the team
    team = Teams.get_team!(id)
    team = Repo.preload(team, :teams_members)
    team = Repo.preload(team, :users)

    # Get the user from the token
    jwt =
      conn
      |> get_req_header("authorization")
      |> List.first()
      |> String.split(" ")
      |> List.last()

    case Guardian.decode_and_verify(jwt) do
      {:ok, claims} ->
        # user
        user = Accounts.get_user!(claims["sub"])

        # check if user is in the team or role is admin
        if Enum.any?(team.teams_members, fn tm -> tm.user_id == user.id end) or
             claims["role"] == "admin" do
          users =
            for team_member <- team.teams_members do
              user = Accounts.get_user!(team_member.user_id)
              user
            end

          render(conn, :team_users, team: team)
        else
          conn
          |> send_resp(401, "You are not in this team")
          |> halt()
        end

      {:error, _reason} ->
        conn
        |> send_resp(401, "Your token is invalid")
        |> halt()
    end
  end
end
