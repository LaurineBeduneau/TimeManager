defmodule TimeManagerApi.Teams.Team do
  use Ecto.Schema
  import Ecto.Changeset

  schema "teams" do
    field :name, :string

    timestamps(type: :utc_datetime)

    has_many :teams_members, TimeManagerApi.Teams.TeamsMembers
    has_many :users, through: [:teams_members, :user]
  end

  @doc false
  def changeset(team, attrs) do
    team
    |> cast(attrs, [:name])
    |> validate_required([:name])
  end
end
