{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  # The buildInputs attribute is a list of packages that are available in
  # the shell.
  buildInputs = [
    # Frontend dependencies
    pkgs.nodejs-18_x
    pkgs.nodePackages.npm

    # Python environment for the ML API and pipeline
    pkgs.python311
    pkgs.python311Packages.numpy
    pkgs.python311Packages.pandas
    pkgs.python311Packages.scikit-learn
    pkgs.python311Packages.matplotlib
    pkgs.python311Packages.imbalanced-learn
    pkgs.python311Packages.shap
    pkgs.python311Packages.joblib
  ];
}