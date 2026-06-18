# itsshops core back

## importing/exporting datasets

- first, login in via 
```
npx sanity login
```
in terminal

create a tar.gz locally from a sanity dataset
```
SANITY_IMPORT_TOKEN=[sanity token] npx sanity dataset export production prod.tar.gz -p [sanity project id]
```

load local tar.gz into a sanity dataset
```
SANITY_IMPORT_TOKEN=[sanity token] npx sanity dataset import dev.tar.gz production -p [sanity project id]
```