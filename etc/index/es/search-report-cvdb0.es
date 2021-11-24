curl -X GET "10.1.7.103:9200/cvdb-report-index-000001/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match_all": { }
  }
}
'
