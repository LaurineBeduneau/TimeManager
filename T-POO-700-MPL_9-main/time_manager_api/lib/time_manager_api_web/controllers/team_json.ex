defmodule TimeManagerApiWeb.TeamJSON do
  alias TimeManagerApi.Accounts.User
  alias TimeManagerApi.Teams.Team

  @doc """
  Renders a list of teams.
  """
  def index(%{teams: teams}) do
    %{data: for(team <- teams, do: data(team))}
  end

  @doc """
  Renders a single team.
  """
  def show(%{team: team}) do
    %{data: data(team)}
  end

  defp data(%Team{} = team) do
    %{
      id: team.id,
      name: team.name,
      members_count: length(team.users),
    }
  end

  # list of teams for a user
  def my_teams(%{teams: teams}) do
    %{data: for(team <- teams, do: data(team))}
  end

  defp dataUsr(%User{} = user) do
    %{
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    }
  end

  # list of users for a team
  def team_users(%{team: team}) do
    %{data: for(user <- team.users, do: dataUsr(user))}
  end
end
