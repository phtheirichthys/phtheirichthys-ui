{
  description = "phtheirichthys-ui — Vue 3 / Vite frontend";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        nodejs = pkgs.nodejs_22;
      in
      {
        packages.default = pkgs.buildNpmPackage {
          pname = "phtheirichthys-ui";
          version = "0.0.0";

          src = ./.;

          npmDepsHash = pkgs.lib.fakeHash;

          buildPhase = ''
            npm run build
          '';

          installPhase = ''
            cp -r dist $out
          '';
        };

        devShells.default = pkgs.mkShell {
          buildInputs = [
            nodejs
          ];

          shellHook = ''
            echo "Node $(node --version) — npm $(npm --version)"
            echo "Run 'npm install' puis 'npm run dev' pour démarrer Vite."
          '';
        };
      }
    );
}
