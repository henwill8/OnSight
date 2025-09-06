import { useState, useEffect, Dispatch, SetStateAction } from "react";

interface UseRouteFormReturn {
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  difficulty: string;
  setDifficulty: Dispatch<SetStateAction<string>>;
  canSubmit: boolean;
}

export const useRouteForm = (imageUri: string | null): UseRouteFormReturn => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    setCanSubmit(!!difficulty && !!imageUri && !!name.trim());
  }, [difficulty, imageUri, name]);

  return {
    name,
    setName,
    description,
    setDescription,
    difficulty,
    setDifficulty,
    canSubmit,
  };
};
