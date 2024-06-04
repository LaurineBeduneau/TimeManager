# Use the official Elixir image from Docker Hub
FROM elixir:latest

# Install Debian packages
RUN apt-get update && \
    apt-get install -y build-essential inotify-tools postgresql-client git && \
    apt-get clean

# Set the working directory
WORKDIR /app

# Copy the application code into the container
COPY . /app

# Install Phoenix packages
RUN mix local.hex --force && \
    mix local.rebar --force && \
    mix archive.install --force hex phx_new 1.5.1

# Expose the port your Phoenix app will run on
EXPOSE 4000

# Define the command to start your Phoenix app
RUN chmod 755 entrypoint.sh
CMD ["sh", "entrypoint.sh"]
