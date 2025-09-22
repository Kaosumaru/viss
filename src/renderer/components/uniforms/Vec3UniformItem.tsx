import type { UniformItemProps } from "./UniformItem";
import BaseVectorUniformItem from "./BaseVectorItem";

const Vec3UniformItem: React.FC<UniformItemProps> = ({
  name,
  uniform,
  onChange,
  onChangeValue,
  onRemove,
}) => {
  return (
    <BaseVectorUniformItem
      name={name}
      uniform={uniform}
      onChangeValue={onChangeValue}
      onChange={onChange}
      onRemove={onRemove}
      dimensions={3}
    />
  );
};

export default Vec3UniformItem;
