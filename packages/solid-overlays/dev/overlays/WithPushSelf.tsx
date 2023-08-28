import { useOverlay } from ".";
import Card from "../components/Card";

type WithPushSelfProps = {
  depth?: number;
};

export default function WithPushSelf(props: WithPushSelfProps) {
  const overlay = useOverlay(WithPushSelf);

  return (
    <Card>
      Depth: {props.depth || 0}
      <br />
      <button
        onClick={() => {
          overlay.pushSelf({ depth: (props.depth || 0) + 1 });
        }}
      >
        Push self
      </button>
    </Card>
  );
}
