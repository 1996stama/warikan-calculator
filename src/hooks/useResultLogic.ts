import useWarikanStore from "../store/useWarikanStore";
import { Expense } from "../types";

type MemberCalculation = {
    [key: string]: number;
};

//各メンバーが支払った個人総額を算出
const calculateTotalPaidByMember = (members: string[], expenses: Expense[]) => {
    //集計結果を入れるための箱 = オブジェクトを準備
    //最終的に { "田中": 5000, "佐藤": 2000 } のような形を目指す
    const totalPaidByMember: MemberCalculation = {};

    //引数で受け取った最新の members を一つずつ回し、それぞれの value を 0 にする
    //totalPaidByMemberオブジェクトの key は動的な member で、それに対し = 0 で valueを0にしている
    //member には"田中"や"佐藤"など、動的な値が入る可能性があるため、ブラケット記法で書いている
    //obj[key] = sample で key の value が sample になるというデフォルト仕様
    //2段階に分けて、中身を塗り替えている
    //1回目は枠組み(0円)を作り...
    members.forEach((member) => (totalPaidByMember[member] = 0));
    //2回目で合計金額を積み上げている(加算代入 +=)
    expenses.forEach((expense) => {
        totalPaidByMember[expense.paidBy] += expense.amount;
    });

    //出来上がった新しい、各人の合計支払い合計金額がはいったオブジェクトを返す
    // { "田中": 5000, "佐藤": 2000 }のような値がreturnされる
    return totalPaidByMember;
};

//全員の総額を算出
//{ "田中": 5000, "佐藤": 2000 } のような値が引数として入る
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
    //小数点が出るケース 例えば、「3人で 10,000円」を支払った場合
    //合計金額: 10,000円 人数: 3人
    //1人あたりの平均(totalPerMember)は 10,000 / 3 = 3333.3333... となる
};

//それぞれのメンバーの過払い額 or 不足額を算出
//totalPerMember(平均額)という共通の基準点に対し、一人一人がどれだけズレているかを計算する
const calculateDifferences = (members: string[], totalPaidByMember: MemberCalculation, totalPerMember: number) => {
    //空のオブジェクトを作成
    const differences: MemberCalculation = {};
    //空っぽの箱(オブジェクト)に、名前シールを貼りながら中身を詰め込んでいる
    //JavaScriptのオブジェクトには、「まだ存在しない名前(key)を指定して代入すると、その場で新しく作ってくれる」という便利な性質がある
    //forEach = 配列の中に入っている要素(中身)の個数分だけ...
    members.forEach((member) => {
        //外にある differences という箱に、ひたすらデータを放り込む という単純作業を繰り返している
        differences[member] = totalPaidByMember[member] - totalPerMember;
    });
    //{ "田中": 5000, "佐藤": 2000 }があり...
    //田中であれば、5000 - 3500 = 1500 佐藤であれば、2000 - 3500 = -1500 となり...
    // differences = {
    //  "田中": 1500,
    //  "佐藤": -1500,
    // }
    //というオブジェクトが完成する
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
    //string[] = 文字列の配列 のように、{ from: string... }[] = のようなカタチをした配列です と型定義している
    const warikanPlan: { from: string; to: string; amount: number }[] = [];

    // differences = {
    //  "田中": 1500,
    //  "佐藤": -1500,
    // } のようなオブジェクトのkeyだけを抽出し...
    //differences["田中"] は 1500、0より大きいので合格(配列に残る)
    //differences["佐藤"] は -1500、0より小さいので不合格(除外)
    const overpaidMembers = Object.keys(differences).filter((member) => differences[member] > 0);
    //differences["田中"] は 1500、0より大きいので不合格(除外)
    //differences["佐藤"] は -1500、0より小さいので合格(配列に残る)
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
                //四捨五入
                amount: Math.round(amount),
            });
            //receiver = 田中の場合、現状のvalueから、1500を引く
            differences[receiver] -= amount;
            //payer = 佐藤の場合、現状のvalueに、1500を足す
            differences[payer] += amount;
        }

        //receiver = 田中の場合、value が0の場合は、overpaidMembersを抜ける
        //配列の「先頭(0番目)」を取り除き、残りの要素を前に詰める
        if (differences[receiver] === 0) overpaidMembers.shift();
        if (differences[payer] === 0) underpaidMembers.shift();
        //もし、一度に全額払いきれない場合(例：1500円もらう人に、1000円だけ払う場合)は...
        //1500 - 1000 = 500 となり、「まだ 500円 もらう権利が残っているよ」という状態で次のループへ引き継がれる
    }

    return warikanPlan;
};

/**
 * 割り勘を行うための最適な精算方法を求めます。
 *
 * @remarks
 * このフックでは、以下の処理が行われます：
 * 1. 各メンバーが支払った個人総額を算出
 * 2. 全員の総額を算出
 * 3. １人あたりが本来支払うべき金額（割り勘）を算出
 * 4. それぞれのメンバーの過払い額または不足額を算出
 * 5. 各メンバーの過不足を比較して相殺
 */
const useResultLogic = () => {
    //現時点の members と expenses を習得する
    const members = useWarikanStore((state) => state.members);
    const expenses = useWarikanStore((state) => state.expenses);

    //もし、members もしくは expenses に値が入っていなければ から配列を返す
    if (members.length === 0 || expenses.length === 0) {
        return [];
    }

    //定義を最初につくり、実行するのが関数処理の流れ
    //現状の members　と expenses を calculateTotalPaidByMember へ引数として渡した結果、返ってきた値を格納する
    const totalPaidByMember = calculateTotalPaidByMember(members, expenses);
    const total = calculateTotal(totalPaidByMember);
    const totalPerMember = calculateTotalPerMember(total, members);
    const differences = calculateDifferences(members, totalPaidByMember, totalPerMember);

    return calculateWarikanPlan(differences);
};

export default useResultLogic;
