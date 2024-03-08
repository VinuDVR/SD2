Git Workflow
This text  outlines the Git workflow used in our coursework repository.

Branches

1. main Branch
Main branch containing stable, deployable code.
Updated only with code from release branches.

3. develop Branch
Ongoing development work will be done on this branch
Feature branches are merged into this branch.

5. Release Branches
Branched off of develop when preparing for a new release.
Bug fixes and final adjustments for the release are made here before merging into main.
Named the same as the release version using semantic versioning (major.minor.patch).
