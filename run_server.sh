export PATH="$PATH:$REPL_HOME/.nix-profile/bin"

if [ ! -d "db_data" ]; then
    initdb -D db_data
fi

pg_ctl -D db_data -l logfile start &&\
psql -f database.sql &&\
npm run dev:server