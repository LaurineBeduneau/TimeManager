defmodule TimeManagerApi.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset
  alias TimeManagerApi.Teams.Team

  schema "users" do
    field(:username, :string)
    field(:email, :string)
    field(:password, :string, virtual: true)
    field(:password_confirmation, :string, virtual: true)
    field(:password_hash, :string)
    field(:role, :string, default: "user")

    timestamps(type: :utc_datetime)

    has_many(:teams_members, TimeManagerApi.Teams.TeamsMembers)
    has_many(:teams, through: [:teams_members, :team])
  end

  def changeset(user, attrs) do
    user
    |> cast(attrs, [:username, :email, :password, :password_confirmation, :role])
    |> validate_required([:username, :email, :password, :password_confirmation])
    |> validate_length(:password, min: 2)
    |> validate_confirmation(:password)
    |> validate_format(:email, ~r/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)
    |> unique_constraint(:email)
    |> hash_password()
  end

  def changeset_update(user, attrs) do
    user
    |> cast(attrs, [:username, :email, :password, :role])
    |> validate_required([:password])
    |> validate_length(:password, min: 2)
    |> validate_format(:email, ~r/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)
    |> unique_constraint(:email)
    |> hash_password()
  end

  def changeset_update_admin(user, attrs) do
    user
    |> cast(attrs, [:username, :email, :password, :role])
    |> validate_length(:password, min: 2)
    |> validate_format(:email, ~r/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)
    |> unique_constraint(:email)
    |> hash_password()
  end

  defp hash_password(changeset) do
    if changeset.valid? && get_change(changeset, :password) do
      put_change(
        changeset,
        :password_hash,
        Comeonin.Bcrypt.hashpwsalt(get_change(changeset, :password))
      )
    else
      changeset
    end
  end
end
