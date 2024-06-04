defmodule TimeManagerApi.Repo.Migrations.New do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :username, :string
      add :email, :string
      add :password, :string
      add :confirm_password, :string
      add :password_hash, :string
      add :role, :string, default: "user"

      timestamps(type: :utc_datetime)
    end

    create unique_index(:users, [:email])

    create table(:workingtimes) do
      add :start, :utc_datetime
      add :end, :utc_datetime
      add :user_id, references(:users, on_delete: :nothing)

      timestamps(type: :utc_datetime)
    end

    create index(:workingtimes, [:user_id])

    create table(:clocks) do
      add :time, :utc_datetime
      add :status, :boolean, default: false, null: false
      add :user_id, references(:users, on_delete: :nothing)

      timestamps(type: :utc_datetime)
    end

    create index(:clocks, [:user_id])

    create table(:teams) do
      add :name, :string

      timestamps(type: :utc_datetime)
    end

    create table(:teams_members, primary_key: false) do
      add :team_id, references(:teams), primary_key: true
      add :user_id, references(:users), primary_key: true
    end
  end
end
