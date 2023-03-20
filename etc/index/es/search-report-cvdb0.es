curl -X GET "http://10.1.8.202:9200/cvdb-flip-report-index-000000/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match_all": { }
  }
}
'
