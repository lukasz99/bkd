curl -X GET "10.1.7.103:9200/dip-node-index-000000/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match_all": { }
  }
}
'
