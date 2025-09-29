{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    python310
    # Useful tools
    python310Packages.pip
    python310Packages.setuptools
    python310Packages.wheel

    # Python packages used by the project
    python310Packages.fastapi
    python310Packages.uvicorn
    python310Packages.sqlalchemy
    python310Packages.psycopg2  # or psycopg2-binary; psycopg2 is the nix package here
    python310Packages.python-multipart

    # Optional: PostgreSQL client library (libpq) to avoid psycopg2 build issues
    postgresql
  ];

  # Optionally set an easy-to-see prompt
  shellHook = ''
    echo "Entered nix-shell with FastAPI & dependencies. Run: python -m uvicorn main:app --reload"
  '';
}
