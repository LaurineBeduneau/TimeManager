defmodule TimeManagerApi.Teams do
  @moduledoc """
  The Teams context.
  """

  import Ecto.Query, warn: false
  alias TimeManagerApi.Repo

  alias TimeManagerApi.Teams.Team
  alias TimeManagerApi.Teams.TeamsMembers

  @doc """
  Returns the list of teams.

  ## Examples

      iex> list_teams()
      [%Team{}, ...]

  """
  def list_teams do
    Repo.all(Team)
  end

  @doc """
  Gets a single team.

  Raises `Ecto.NoResultsError` if the Team does not exist.

  ## Examples

      iex> get_team!(123)
      %Team{}

      iex> get_team!(456)
      ** (Ecto.NoResultsError)

  """
  def get_team!(id), do: Repo.get!(Team, id)

  def get_teams_of_user(user_id) do
    from(t in Team,
      join: tm in assoc(t, :teams_members),
      join: u in assoc(tm, :user),
      where: u.id == ^user_id,
      select: t
    )
    |> Repo.all()
  end

  @doc """
  Creates a team.

  ## Examples

      iex> create_team(%{field: value})
      {:ok, %Team{}}

      iex> create_team(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_team(attrs \\ %{}) do
    %Team{}
    |> Team.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a team.

  ## Examples

      iex> update_team(team, %{field: new_value})
      {:ok, %Team{}}

      iex> update_team(team, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_team(%Team{} = team, attrs) do
    team
    |> Team.changeset(attrs)
    |> Repo.update()
  end

  def add_user_to_team(%Team{} = team, user_id) do
    Repo.insert!(%TeamsMembers{team_id: team.id, user_id: user_id})
  end

  @doc """
  Deletes a team.

  ## Examples

      iex> delete_team(team)
      {:ok, %Team{}}

      iex> delete_team(team)
      {:error, %Ecto.Changeset{}}

  """
  def delete_team(%Team{} = team) do
    # Get the members associated with the team
    members = Repo.all(from(tm in TeamsMembers, where: tm.team_id == ^team.id))

    # Delete the members
    Enum.each(members, fn member ->
      Repo.delete(member)
    end)

    # Delete the team
    Repo.delete(team)
  end

  def remove_user_from_team(%Team{} = team, user_id) do
    Repo.delete_all(
      from(tm in TeamsMembers, where: tm.team_id == ^team.id and tm.user_id == ^user_id)
    )
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking team changes.

  ## Examples

      iex> change_team(team)
      %Ecto.Changeset{data: %Team{}}

  """
  def change_team(%Team{} = team, attrs \\ %{}) do
    Team.changeset(team, attrs)
  end
end
