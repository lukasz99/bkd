curl -X GET "10.1.7.103:9200/cvdb-node-index-000001/_count" -H 'Content-Type: application/json' -d'
{"query": {"match_all":{}}}
'
