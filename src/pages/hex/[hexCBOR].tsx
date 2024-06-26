import type { NextPage } from "next";
import { useRouter } from "next/router";
import { Layout, Modal } from "../../components/layout";
import { Loading } from "../../components/status";
import { TransactionLoader } from "../../components/transaction";

const GetTransaction: NextPage = () => {
  const router = useRouter();
  const { hexCBOR } = router.query;

  if (typeof hexCBOR !== "string") return null;

  return (
    <Layout>
      {!hexCBOR && (
        <Modal>
          <Loading />
        </Modal>
      )}
      {hexCBOR && <TransactionLoader content={Buffer.from(hexCBOR, "hex")} />}
    </Layout>
  );
};

export default GetTransaction;
