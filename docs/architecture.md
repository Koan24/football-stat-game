# Application architecture

The planned application architecture:

```text
External football data source
            |
            v
      Import script
            |
            v
       PostgreSQL
            |
            v
    Node.js / Express API
            |
            v
       React frontend