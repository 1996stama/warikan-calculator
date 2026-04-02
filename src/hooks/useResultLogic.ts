import useWarikanStore from "../store/useWarikanStore";
import { Expense } from "../types";

type MemberCalculation = {
    [key: string]: number;
};

//各メンバーが支払った個人総額を算出
const calculateTotalPaidByMember = (members: string[], expenses: Expense[]) => {
    //集計結果を入れるための箱 = オブジェクトを準備
    const totalPaidByMember: MemberCalculation = {};

    //引数で受け取った最新の members を一つずつ回し、それぞれの value を 0 にする
    //totalPaidByMemberオブジェクトの key は動的な member で、それに対し = 0 で valueを0にしている
    //member には"田中"や"佐藤"など、動的な値が入る可能性があるため、ブラケット記法で書いている
    //obj[key] = sample で key の value が sample になるというデフォルト仕様
    //2段階に分けて、中身を塗り替えている 1回目は枠組み(0円)を作り...
    members.forEach((member) => (totalPaidByMember[member] = 0));
    //2回目で合計金額を積み上げている(加算代入 +=)
    expenses.forEach((expense) => {
        totalPaidByMember[expense.paidBy] += expense.amount;
    });

    //各人の合計支払い合計金額 { "田中": 5000, "佐藤": 2000 }のような値がreturnされる
    return totalPaidByMember;
};

//全員の総額を算出 { "田中": 5000, "佐藤": 2000 } のような値が引数として入る
const calculateTotal = (totalPaidByMember: MemberCalculation) => {
    //Object.values = 集計表から「名前」を捨て、「金額」だけを取り出し、配列にする
    //[5000, 2000]のような値を .reduce()で合計する => 7000 がreturnされる
    return Object.values(totalPaidByMember).reduce((a, b) => a + b, 0);
};

//１人あたりが本来支払うべき金額(割り勘)を算出
//{ "田中": 5000, "佐藤": 2000 }であれば、7000 ÷ 2 = 3500 になり...
//田中の払いすぎ、佐藤の不足分を調整するために算出
const calculateTotalPerMember = (total: number, members: string[]) => {
    return total / members.length;
    //例えば、「3人で 10,000円」を支払った場合 => 合計金額: 10,000円 人数: 3人
    //1人あたりの平均(totalPerMember)は 10,000 / 3 = 3333.3333... となる
};

//それぞれのメンバーの過払い額 or 不足額を算出
//totalPerMember(平均額)という共通の基準点に対し、一人一人がどれだけズレているかを計算する
const calculateDifferences = (members: string[], totalPaidByMember: MemberCalculation, totalPerMember: number) => {
    const differences: MemberCalculation = {};
    //空っぽの箱(オブジェクト)に、名前シールを貼りながら中身を詰め込んでいる
    //JSのオブジェクトには、「まだ存在しない名前(key)を指定して代入すると、その場で新しく作ってくれる」という性質がある
    //forEach = 外にある differences という箱に、配列の中にある要素分だけ、ひたすらデータを放り込んでいる
    members.forEach((member) => {
        differences[member] = totalPaidByMember[member] - totalPerMember;
    });
    //{ "田中": 5000, "佐藤": 2000 }があり...
    //田中であれば、5000 - 3500 = 1500 佐藤であれば、2000 - 3500 = -1500 となり...
    // differences = {
    //  "田中": 1500,
    //  "佐藤": -1500,
    // } というオブジェクトが完成する
    return differences;
};

//各メンバーの過不足を相殺し、最適な精算方法を算出する
const calculateWarikanPlan = (differences: MemberCalculation) => {
    //例) const scores: number[] = [80, 95, 70];
    //例)「名前と数字のセット」などが並ぶ、少しリッチなデータの束
    // const products: { id: number; name: string; price: number }[] = [
    //  { id: 1, name: "リンゴ", price: 150 },
    //  { id: 2, name: "バナナ", price: 100 }
    // ];
    //例)「型」に名前をつけてスッキリさせる
    // type Member = { id: number; name: string };
    // const members: Member[] = [
    //  { id: 1, name: "田中" },
    //  { id: 2, name: "佐藤" }
    // ];
    const warikanPlan: { from: string; to: string; amount: number }[] = [];

    // differences = {
    //  "田中": 1500,
    //  "佐藤": -1500,
    // } のようなオブジェクトのkeyだけを抽出し...
    //differences["田中"] は 1500、0より大きいので配列に残る differences["佐藤"] は -1500、0より小さいので除外
    const overpaidMembers = Object.keys(differences).filter((member) => differences[member] > 0);
    //differences["田中"] は 1500、0より大きいので除外 differences["佐藤"] は -1500、0より小さいので配列に残る
    const underpaidMembers = Object.keys(differences).filter((member) => differences[member] < 0);

    //過払いメンバーの数が0より大きく、過不足メンバーの数も0より大きい場合...
    //while = 条件に当てはまらなくなるまで処理をループする
    while (overpaidMembers.length > 0 && underpaidMembers.length > 0) {
        //過払いメンバーの先頭(0)を指定
        const receiver = overpaidMembers[0];
        //過不足メンバーの先頭(0)を指定
        const payer = underpaidMembers[0];
        // differences = {
        //  "田中": 1500,
        //  "佐藤": -1500,
        // }
        //純粋に「どっちの絶対値(金額の大きさ)が小さいか？」を比べられるように、payer の金額を+にしている
        const amount = Math.min(differences[receiver], -differences[payer]);

        //amountはほぼ確実に0以上になっているが、念のため
        if (amount > 0) {
            //最初に作ったwarikanPlan配列に値を入れていく
            warikanPlan.push({
                from: payer,
                to: receiver,
                amount: Math.round(amount),
            });
            //receiver = 田中の場合、現状のvalueから、1500を引く
            differences[receiver] -= amount;
            //payer = 佐藤の場合、現状のvalueに、1500を足す
            differences[payer] += amount;
        }

        //receiver = 田中の場合、value が0の場合は、overpaidMembersを抜ける
        //shift() = 配列の「先頭(0番目)」を取り除き、残りの要素を前に詰める
        if (differences[receiver] === 0) overpaidMembers.shift();
        if (differences[payer] === 0) underpaidMembers.shift();
        //もし、一度に全額払いきれない場合(例：1500円もらう人に、1000円だけ払う場合)は...
        //1500 - 1000 = 500 となり、「まだ 500円 もらう権利が残っているよ」という状態で次のループへ引き継がれる
    }

    return warikanPlan;
};

const useResultLogic = () => {
    const members = useWarikanStore((state) => state.members);
    const expenses = useWarikanStore((state) => state.expenses);

    if (members.length === 0 || expenses.length === 0) {
        return [];
    }

    //定義を最初につくり、実行するのが関数処理の流れ
    const totalPaidByMember = calculateTotalPaidByMember(members, expenses);
    const total = calculateTotal(totalPaidByMember);
    const totalPerMember = calculateTotalPerMember(total, members);
    const differences = calculateDifferences(members, totalPaidByMember, totalPerMember);

    return calculateWarikanPlan(differences);
};

export default useResultLogic;
