import { useOverlay } from ".";
import Card from "../components/Card";

type WithOpenSelfProps = {
  depth?: number;
};

export default function WithOpenSelf(props: WithOpenSelfProps) {
  const overlay = useOverlay(WithOpenSelf);

  return (
    <Card>
      Depth: {props.depth || 0}
      <br />
      <button
        onClick={() => {
          overlay.openSelf({ depth: (props.depth || 0) + 1 });
        }}
      >
        Open self
      </button>
    </Card>
  );
}
