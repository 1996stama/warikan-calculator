import useWarikanStore from "../store/useWarikanStore";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { Trash2 } from "lucide-react";

const ExpenseList = (): JSX.Element => {
    const members = useWarikanStore((state) => state.members);
    const expenses = useWarikanStore((state) => state.expenses);
    const inputExpense = useWarikanStore((state) => state.inputExpense);
    const updateInputExpense = useWarikanStore((state) => state.updateInputExpense);
    const addExpense = useWarikanStore((state) => state.addExpense);
    const removeExpense = useWarikanStore((state) => state.removeExpense);

    return (
        <Card
            logo="✏️"
            title="支払い記録"
        >
            {/* selectのvalueには、optionのvalueが入る これはルール*/}
            <select
                className="p-2 border rounded w-full"
                //初期値は""(空)
                //optionで選択された後、処理が走り、最後に値が入る
                value={inputExpense.paidBy}
                //optionが選択されると発火
                //現状のinputExpenseをバラし、paidByだけ、選択されたoptionのvalue値を入れ、新しいオブジェクトを作り直す
                //オブジェクトでのスプレッド構文は上書き 配列でのスプレッド構文は追加(keyという概念が無いため)
                //その作り直したオブジェクトをupdateInputExpenseへ引数として送る
                onChange={(e) => updateInputExpense({ ...inputExpense, paidBy: e.target.value })}
            >
                <option value="">支払った人</option>
                {members.map(
                    (member) =>
                        member && (
                            //ユーザーが誰かを選択すると e.target.value がその値になる
                            //e.taget.valueは常にvalue属性の値
                            //optionはただの選択肢 イベント変更はselectで起こる
                            <option
                                key={member}
                                value={member}
                            >
                                {member}
                            </option>
                        ),
                )}
            </select>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                    type="text"
                    placeholder="内容"
                    //上書きされた値がvalueに入る
                    value={inputExpense.description}
                    //inputExpenseを一度バラし、入力された値 = e.target.value を description として追加し、オブジェクトを新しく作り直す
                    //その新しく作り直したオブジェクトを引数として、useWarikanStore にある関数へ送る
                    onChange={(e) => updateInputExpense({ ...inputExpense, description: e.target.value })}
                    className="h-10 px-2 border rounded"
                />
                <input
                    //type="number" にしても、値は文字列になってしまうが...
                    //後で valueAsNumber を使うため、type を number にしておく
                    type="number"
                    min={0}
                    placeholder="金額"
                    value={inputExpense.amount || ""}
                    //valueAsNumber で数字にする
                    onChange={(e) => updateInputExpense({ ...inputExpense, amount: e.target.valueAsNumber })}
                    className="h-10 px-2 border rounded"
                />
            </div>
            <Button
                onClick={addExpense}
                className="w-full"
            >
                記録する
            </Button>

            {/* 支払い者の一覧 */}
            <div className="space-y-2">
                {expenses.map((expense) => (
                    <div
                        key={expense.description}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                        <span>
                            {expense.paidBy}が{expense.description}で{expense.amount}円支払い
                        </span>
                        <Button onClick={() => removeExpense(expense.description)}>
                            <Trash2 className="w-4 y-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default ExpenseList;
