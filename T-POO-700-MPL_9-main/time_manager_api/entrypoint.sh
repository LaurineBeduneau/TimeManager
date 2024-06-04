#!/bin/bash
# Docker entrypoint script.
# cd bootstrap
# Wait until Postgres is ready

mix deps.get
mix deps.compile

mix ecto.create
# mix phx.gen.schema User users first_name:string last_name:string
# mix phx.gen.schema Task tasks title:string description:string status:string user_id:references:users
mix ecto.migrate

mix phx.server