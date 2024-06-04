defmodule TimeManagerApi.Teams.TeamsMembers do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key false
  schema "teams_members" do
    belongs_to :team, TimeManagerApi.Teams.Team, primary_key: true
    belongs_to :user, TimeManagerApi.Accounts.User, primary_key: true
  end
end
