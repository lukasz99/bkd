curl -X GET "10.1.8.202:9200/cvdb-flop-node-index-000000/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match_all": { }
  }
}
'
