defmodule TimeManagerApiWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :time_manager_api

  # The session will be stored in the cookie and signed,
  # this means its contents can be read but not tampered with.
  # Set :encryption_salt if you would also like to encrypt it.
  @session_options [
    store: :cookie,
    key: "_time_manager_api_key",
    signing_salt: "GpaSMoJL",
    same_site: "Lax"
  ]

  # We define a CORS plug here so all endpoints in the pipeline
  plug(Corsica,
    max_age: 600,
    origins: "*",
    allow_headers: ["accept", "content-type", "authorization"],
    allow_methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_credentials: true,
    log: [rejected: :error, invalid: :warn, accepted: :debug]
  )

  socket("/live", Phoenix.LiveView.Socket, websocket: [connect_info: [session: @session_options]])

  # Serve at "/" the static files from "priv/static" directory.
  #
  # You should set gzip to true if you are running phx.digest
  # when deploying your static files in production.
  plug(Plug.Static,
    at: "/",
    from: :time_manager_api,
    gzip: false,
    only: TimeManagerApiWeb.static_paths()
  )

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    socket("/phoenix/live_reload/socket", Phoenix.LiveReloader.Socket)
    plug(Phoenix.LiveReloader)
    plug(Phoenix.CodeReloader)
    plug(Phoenix.Ecto.CheckRepoStatus, otp_app: :time_manager_api)
  end

  plug(Phoenix.LiveDashboard.RequestLogger,
    param_key: "request_logger",
    cookie_key: "request_logger"
  )

  plug(Plug.RequestId)
  plug(Plug.Telemetry, event_prefix: [:phoenix, :endpoint])

  plug(Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()
  )

  plug(Plug.MethodOverride)
  plug(Plug.Head)
  plug(Plug.Session, @session_options)
  plug(TimeManagerApiWeb.Router)
end
