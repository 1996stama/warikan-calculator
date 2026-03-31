//Zustand = アプリの見た目とロジックを完全に切り離す
import { create } from "zustand";
import { Expense } from "../types";

//「今何があるか？」の状態を示す
type State = {
    inputMember: string;
    inputExpense: Expense;
    members: string[];
    expenses: Expense[];
};

//「何が出来るか？」の振る舞いを示す
type Action = {
    //void = stateの中身を更新するだけ 何も値は返らない
    updateInputMember: (inputMember: string) => void;
    updateInputExpense: (inputExpense: Expense) => void;
    addMember: () => void;
    addExpense: () => void;
    removeExpense: (description: string) => void;
};

//Zustandの create の中身は、実は巨大な { }（オブジェクト）
//「データ（State）」と「動かし方（Action）」を一つの塊（オブジェクト）にして管理するという設計思想
//createで作った箱の中身をsetで書き換えると、それを使っているすべてのコンポーネントが「変わった！」と検知して自動で再描画する
//createを実行した瞬間に、引数であるsetにZustandがcreate内で定義するstateの更新関数をすべて入れてくれる
const useWarikanStore = create<State & Action>((set) => ({
    //initial state = アプリが起動した瞬間に、その箱の中に実際に入れる最初の値を定義
    //useStateでは一つ一つ作るが、ここで一気に初期値を決めている
    inputMember: "", //空文字は文字列
    inputExpense: { paidBy: "", description: "", amount: 0 },
    members: [],
    expenses: [],

    //引数を任意の名(inputMember)で受け取り、inputMember(createで用意したstateの1つであるkey)に、その引数を入れて更新する(set)
    updateInputMember: (inputMember: string) => set(() => ({ inputMember: inputMember })),
    updateInputExpense: (inputExpense: Expense) => set(() => ({ inputExpense: inputExpense })),

    addMember: () =>
        //state = ボタンを押したその瞬間のStoreの中身 = onChangeで一文字ずつ更新されてきた「最新の入力文字」がinputMemberに入っている
        //set((state) => { ... }) のstateが「中身全部」として抱えているのは、最初に定義した4つのstate(厳密にはActionも含む)
        set((state) => {
            //inputMember(文字)の前後の空白をtrim()で無くす
            const trimmedMember = state.inputMember.trim();
            //memmbers配列にtrimmedMemberが含まれているか確認(含まれていればtrue)
            //includes()により、確認結果(trueかfalse)を変数に覚えさせている
            const isDuplicateMember = state.members.includes(trimmedMember);
            //trimmedMemberに文字が入っており、かつ、isDuplicateMemberがfalse(新しい追加)であれば...
            if (trimmedMember && !isDuplicateMember) {
                return {
                    //現状のmembers配列を一度バラし(新しい配列をゼロからつくる)、新たなtrimmedMemberを追加する
                    members: [...state.members, trimmedMember],
                    //入力欄をリセットする
                    inputMember: "",
                };
            }
            //条件に当てはまらない場合は、現状のstateをそのまま返す
            //関数の入り口(引数)で預かった、その瞬間のStoreの中身全部
            return state;
            //関数は呼び出されたら、必ず何かしら(戻り値)を返さなければならない、というルールがある
        }),

    addExpense: () =>
        set((state) => {
            const { paidBy, description, amount } = state.inputExpense;
            const trimmedDescription = description.trim();
            const isDuplicateDescription = state.expenses.some((expense) => expense.description === trimmedDescription);
            if (paidBy && trimmedDescription && amount && !isDuplicateDescription) {
                return {
                    expenses: [...state.expenses, { ...state.inputExpense, description: trimmedDescription }],
                    inputExpense: { paidBy: "", description: "", amount: 0 },
                };
            }
            return state;
        }),

    removeExpense: (description: string) =>
        set((state) => {
            return {
                expenses: state.expenses.filter((expense) => expense.description !== description),
            };
        }),
}));

export default useWarikanStore;
