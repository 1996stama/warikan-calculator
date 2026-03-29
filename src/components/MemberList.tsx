import Card from "./ui/Card";
import { Plus } from "lucide-react";

const MemberList = () => {
    return (
        <Card
            logo="👥"
            title="メンバーを追加"
        >
            <div>
                <input type="text" />
            </div>
        </Card>
    );
};

export default MemberList;
