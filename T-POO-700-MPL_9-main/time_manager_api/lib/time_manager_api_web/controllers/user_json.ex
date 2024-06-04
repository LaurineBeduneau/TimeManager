defmodule TimeManagerApiWeb.UserJSON do
  alias TimeManagerApi.Accounts.User
  alias TimeManagerApi.Teams.Team

  @doc """
  Renders a list of users.
  """
  def index(%{users: users}) do
    %{data: for(user <- users, do: data(user))}
  end

  @doc """
  Renders a single user.
  """
  def show(%{user: user}) do
    %{data: data(user)}
  end

  def showWithJWT(%{jwt: jwt}) do
    %{jwt: jwt}
  end

  defp data(%User{} = user) do
    %{
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      teams: for(team <- user.teams, do: data_team(team))
    }
  end

  defp data_team(%Team{} = team) do
    %{
      id: team.id,
      name: team.name
    }
  end

  def errors(%{errors: errors}) do
    %{errors: errors}
  end
end
