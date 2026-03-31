import useWarikanStore from "../store/useWarikanStore";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { Trash2 } from "lucide-react";

const ExpenseList = (): JSX.Element => {
    const members = useWarikanStore((state) => state.members);
    const updateInputExpense = useWarikanStore((state) => state.updateInputExpense);

    return (
        <Card
            logo="✏️"
            title="支払い記録"
        >
            <select
                className="p-2 border rounded w-full"
                id=""
            >
                <option value="">支払った人</option>
                {members.map(
                    (member) =>
                        member && (
                            <option
                                key={member}
                                value={member}
                            >
                                {member}
                            </option>
                        ),
                )}
            </select>
        </Card>
    );
};

export default ExpenseList;
