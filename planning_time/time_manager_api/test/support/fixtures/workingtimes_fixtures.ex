defmodule TimeManagerApi.WorkingtimesFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `TimeManagerApi.Workingtimes` context.
  """

  @doc """
  Generate a workingtime.
  """
  def workingtime_fixture(attrs \\ %{}) do
    {:ok, workingtime} =
      attrs
      |> Enum.into(%{
        end: ~U[2023-10-23 08:20:00Z],
        start: ~U[2023-10-23 08:20:00Z]
      })
      |> TimeManagerApi.Workingtimes.create_workingtime()

    workingtime
  end
end
