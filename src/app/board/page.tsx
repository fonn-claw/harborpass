import { getBoardData, getAllSlips } from "@/lib/queries";
import { DispatchBoard } from "@/components/board/dispatch-board";

export default async function BoardPage() {
  const [boardData, slips] = await Promise.all([
    getBoardData(),
    getAllSlips(),
  ]);

  return <DispatchBoard data={boardData} slips={slips} />;
}
