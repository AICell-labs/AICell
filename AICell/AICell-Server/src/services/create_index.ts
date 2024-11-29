import { cellsService } from "./cells"
import { callHistoryService } from "./call_history"


async function main() {
  let res = await cellsService.createIndex();
  console.log(res)

  res = await callHistoryService.createIndex();
  console.log(res)
}

main()
