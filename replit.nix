{
  pkgs, ...
}:
{
  channel = "stable-23.11";
  packages = [
    pkgs.python310
    pkgs.python310Packages.pip
    pkgs.python310Packages.fastapi
    pkgs.python310Packages.uvicorn
    pkgs.python310Packages.psycopg2
    pkgs.python310Packages.sqlalchemy
    pkgs.postgresql
  ];
  env = {
    PYTHONPATH = "$PYTHONPATH:$REPL_HOME/.pythonlibs/lib/python3.10/site-packages";
  };
  shell = {
    shellHook = ''
      export PATH="$PATH:${pkgs.postgresql}/bin"
      export DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase"
    '';
    packages = [ pkgs.postgresql ];
  };
}