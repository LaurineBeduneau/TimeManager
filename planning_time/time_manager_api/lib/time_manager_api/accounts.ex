defmodule TimeManagerApi.Accounts do
  @moduledoc """
  The Accounts context.
  """

  import Ecto.Query, warn: false
  alias TimeManagerApi.Repo
  alias TimeManagerApi.Guardian

  alias TimeManagerApi.Accounts.User
  alias TimeManagerApi.Workingtimes
  alias TimeManagerApi.Workingtimes.Workingtime
  alias TimeManagerApi.Clocks
  alias TimeManagerApi.Clocks.Clock
  alias TimeManagerApi.Teams
  alias TimeManagerApi.Teams.Team
  alias TimeManagerApi.Teams.TeamsMembers

  @doc """
  Returns the list of users.

  ## Examples

      iex> list_users()
      [%User{}, ...]

  """
  def list_users do
    Repo.all(User)
  end

  @doc """
  Gets a single user.

  Raises `Ecto.NoResultsError` if the User does not exist.

  ## Examples

      iex> get_user!(123)
      %User{}

      iex> get_user!(456)
      ** (Ecto.NoResultsError)

  """
  def get_user!(id), do: Repo.get!(User, id)

  def user_exists?(id) do
    if Repo.get_by(TimeManagerApi.Accounts.User, id: id) do
      true
    else
      false
    end
  end

  @doc """
  Creates a user.

  ## Examples

      iex> create_user(%{field: value})
      {:ok, %User{}}

      iex> create_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_user(attrs \\ %{}) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a user.

  ## Examples

      iex> update_user(user, %{field: new_value})
      {:ok, %User{}}

      iex> update_user(user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_user(%User{} = user, attrs) do
    user
    |> User.changeset_update(attrs)
    |> Repo.update()
  end

  def update_user_admin(%User{} = user, attrs) do
    user
    |> User.changeset_update_admin(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a user.

  ## Examples

      iex> delete_user(user)
      {:ok, %User{}}

      iex> delete_user(user)
      {:error, %Ecto.Changeset{}}

  """
  def delete_user(%User{} = user) do
    # Get workingtimes associated with user
    workingtimes =
      Repo.all(from(w in Workingtime, where: w.user_id == ^user.id))

    # Get clocks associated with user
    clocks =
      Repo.all(from(c in Clock, where: c.user_id == ^user.id))

    # Get teams associated with user (teams_members)
    teams =
      Repo.all(from(t in TeamsMembers, where: t.user_id == ^user.id))

    # Delete workingtimes
    Enum.each(workingtimes, fn workingtime ->
      Workingtimes.delete_workingtime(workingtime)
    end)

    # Delete clocks
    Enum.each(clocks, fn clock ->
      Clocks.delete_clock(clock)
    end)

    # Delete teams_members
    Enum.each(teams, fn team ->
      team = Teams.get_team!(team.team_id)
      Teams.remove_user_from_team(team, user.id)
    end)

    # Delete user
    Repo.delete(user)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking user changes.

  ## Examples

      iex> change_user(user)
      %Ecto.Changeset{data: %User{}}

  """
  def change_user(%User{} = user, attrs \\ %{}) do
    User.changeset(user, attrs)
  end

  @doc """
  Finds a user by username and email.

  ## Examples

      iex> get_user_by_username_or_email(username, email)
      %User{}

  """
  def get_user_by_username_or_email(username, email) do
    query =
      from(u in User,
        where: u.username == ^username and u.email == ^email,
        select: u
      )

    Repo.one(query)
  end

  def get_user_by_username(username) do
    query =
      from(u in User,
        where: u.username == ^username,
        select: u
      )

    Repo.one(query)
  end

  @doc """
  Signin with token.

  ## Examples

      iex> token_sign_in(email, password)
      {:ok, token, claims}

  """
  def token_sign_in(email, password) do
    case email_password_auth(email, password) do
      {:ok, user} ->
        if user.role == "admin" do
          Guardian.encode_and_sign(user, %{role: "admin", user_id: user.id})
        else
          if user.role == "manager" do
            Guardian.encode_and_sign(user, %{role: "manager", user_id: user.id})
          else
            # Guardian.encode_and_sign(user, %{role: "user", user_id: user.id})
            Guardian.encode_and_sign(user, %{role: "user", user_id: user.id})
          end
        end

      _ ->
        {:error, :unauthorized}
    end
  end

  defp email_password_auth(email, password) when is_binary(email) and is_binary(password) do
    case get_by_email(email) do
      %User{} = user ->
        if verify_password(password, user) do
          {:ok, user}
        else
          {:error, :unauthorized}
        end

      nil ->
        {:error, :unauthorized}
    end
  end

  defp get_by_email(email) when is_binary(email) do
    Repo.get_by(User, email: String.downcase(email))
  end

  defp verify_password(password, %User{} = user) when is_binary(password) do
    Comeonin.Bcrypt.checkpw(password, user.password_hash)
  end
end
