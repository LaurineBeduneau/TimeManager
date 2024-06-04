defmodule TimeManagerApi.ClocksFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `TimeManagerApi.Clocks` context.
  """

  @doc """
  Generate a clock.
  """
  def clock_fixture(attrs \\ %{}) do
    {:ok, clock} =
      attrs
      |> Enum.into(%{
        status: true,
        time: ~U[2023-10-23 08:29:00Z]
      })
      |> TimeManagerApi.Clocks.create_clock()

    clock
  end

  @doc """
  Generate a clock.
  """
  def clock_fixture(attrs \\ %{}) do
    {:ok, clock} =
      attrs
      |> Enum.into(%{
        status: true,
        time: ~U[2023-10-23 13:40:00Z]
      })
      |> TimeManagerApi.Clocks.create_clock()

    clock
  end

  @doc """
  Generate a clock.
  """
  def clock_fixture(attrs \\ %{}) do
    {:ok, clock} =
      attrs
      |> Enum.into(%{
        status: true,
        time: ~U[2023-10-23 14:05:00Z]
      })
      |> TimeManagerApi.Clocks.create_clock()

    clock
  end
end
