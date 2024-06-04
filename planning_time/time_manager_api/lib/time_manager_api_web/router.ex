defmodule TimeManagerApiWeb.Router do
  use TimeManagerApiWeb, :router
  alias TimeManagerApi.Guardian

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {TimeManagerApiWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  def api_cors_headers(conn, _opts) do
    conn
    |> put_resp_header("access-control-allow-origin", "https://timemanager.lemeyeur.fr/")
    |> put_resp_header("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS")
    |> put_resp_header("access-control-allow-headers", "authorization, origin, content-type, accept")

    # allow every options request to finish with OK
    if conn.method == "OPTIONS" do
      conn
      |> send_resp(200, "")
      |> halt()
    else
      conn
    end
  end

  @doc """
  Middleware to check if the user is admin
  """
  def check_jwt_admin(conn, _opts) do
    try do
      jwt = List.keyfind(conn.req_headers, "authorization", 0)
      jwt = elem(jwt, 1)
      case Guardian.decode_and_verify(jwt) do
        {:ok, claims} ->
          case claims["role"] do
            "admin" ->
              conn
            _ ->
              conn
              |> send_resp(401, "Your not admin")
              |> halt()
          end
        {:error, _reason} ->
          conn
          |> send_resp(401, "Your token is invalid")
          |> halt()
      end
    rescue
      _ ->
        conn
        |> send_resp(401, "You have no token")
        |> halt()
    end
  end

  @doc """
  Middleware to check if the user JWT is manager
  """
  def check_jwt_manager(conn, _opts) do
    try do
      jwt = List.keyfind(conn.req_headers, "authorization", 0)
      jwt = elem(jwt, 1)
      case Guardian.decode_and_verify(jwt) do
        {:ok, claims} ->
          case claims["role"] do
            "manager" ->
              conn
            _ ->
              conn
              |> send_resp(401, "You're not manager")
              |> halt()
          end
        {:error, _reason} ->
          conn
          |> send_resp(401, "Your token is invalid")
          |> halt()
      end
    rescue
      _ ->
        conn
        |> send_resp(401, "You have no token")
        |> halt()
    end
  end


  @doc """
  Middleware to check if the user as valid JWT
  """
  def check_jwt(conn, _opts) do
    jwt = List.keyfind(conn.req_headers, "authorization", 0)
    jwt = elem(jwt, 1)
    case Guardian.decode_and_verify(jwt) do
      {:ok, _claims} ->
        conn
      {:error, _reason} ->
        conn
        |> send_resp(401, "Your token is invalid")
        |> halt()
    end
  end

  @doc """
  Middleware to check if the user JWT is manager or admin
  """
  def check_jwt_manage(conn, _opts) do
    try do
      jwt = List.keyfind(conn.req_headers, "authorization", 0)
      jwt = elem(jwt, 1)
      case Guardian.decode_and_verify(jwt) do
        {:ok, claims} ->
          case claims["role"] do
            "manager" ->
              conn
            "admin" ->
              conn
            _ ->
              conn
              |> send_resp(401, "You're not manager or admin")
              |> halt()
          end
        {:error, _reason} ->
          conn
          |> send_resp(401, "Your token is invalid")
          |> halt()
      end
    rescue
      _ ->
        conn
        |> send_resp(401, "You have no token")
        |> halt()
    end
  end

  pipeline :api_cors do
    plug CORSPlug, origin: "https://timemanager.lemeyeur.fr/", send_preflight_response?: false
    plug :api_cors_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", TimeManagerApiWeb do
    pipe_through :browser

    get "/", PageController, :home
  end

  scope "/api", TimeManagerApiWeb do
    pipe_through [:api, :api_cors]

    get "/", PageController, :home

    scope "/clocks" do
      pipe_through [:check_jwt]
      # get "/", ClockController, :getClocksUserId # get all clocks for user
      get "/", ClockController, :getLatestClock # get latest clock for user
      # post "/:user_id", ClockController, :create
      post "/clockin", ClockController, :setClocksForUser
    end

    scope "/workingtimes" do
      pipe_through [:check_jwt]
      # get "/", PageController, :home

      # put "/:id", WorkingtimeController, :update
      # delete "/:id", WorkingtimeController, :delete

      scope "/manager" do
        pipe_through [:check_jwt_manage]
        get "/:userId", WorkingtimeController, :getAllFromUser
      end

      scope "/:userId" do
        get "/:id", WorkingtimeController, :getOne
        get "/", WorkingtimeController, :getAll
      # post "/", WorkingtimeController, :create
      # options "/", WorkingtimeController, :create
      end
    end


    scope "/users" do

      # Auth routes
      scope "/auth" do
        post "/login", UserController, :login # login
        post "/signup", UserController, :create # signup
      end

      # Admin routes
      scope "/admin" do
        pipe_through [:check_jwt_admin]
        get "/", UserController, :isAdmin # check if user is admin
        get "/users", UserController, :index # get all users ONLY FOR ADMIN
        put "/user/:id", UserController, :update # update user ONLY FOR ADMIN
        delete "/user/:id", UserController, :delete # delete user ONLY FOR ADMIN
      end

      scope "/manager" do
        pipe_through [:check_jwt_manager]
        get "/users", UserController, :index # get all users ONLY FOR MANAGER
        get "/team/:id", TeamController, :getTeamUsers # get all users of a team ONLY FOR MANAGER
        get "/:username", UserController, :getOneByUsername # get user profile ONLY FOR MANAGER
      end

      scope "/profile" do
        pipe_through [:check_jwt]
        get "/", UserController, :show # get user profile
        put "/", UserController, :update # update user profile
        delete "/", UserController, :deleteMyAccount # delete user profile
      end
    end

    scope "/teams" do
      pipe_through [:check_jwt]

      scope "/admin" do
        pipe_through [:check_jwt_admin]
        get "/teams", TeamController, :index # get all teams ONLY FOR ADMIN
        delete "/team/:id", TeamController, :delete # delete team ONLY FOR ADMIN
        put "/team/:id", TeamController, :update # update team ONLY FOR ADMIN
        get "/team/:id", TeamController, :getTeamUsers # get all users of a team ONLY FOR ADMIN
      end

      get "/my", TeamController, :getMyTeams
      get "/:id", TeamController, :show
      get "/:id/members", TeamController, :getTeamUsers
      # TODO: check if user is manager
      get "/", TeamController, :index
      # TODO: check if user is manager
      post "/", TeamController, :create
      put "/:id", TeamController, :update
      put "/:id/add", TeamController, :addUser
      delete "/:id", TeamController, :delete
      put "/:id/remove", TeamController, :removeUser
    end
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:time_manager_api, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: TimeManagerApiWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
