import userModel from "../models/userModel";

const FACE_MATCH_THRESHOLD = 0.3; // or even lower, like 0.3

export const euclideanDistance = (a: number[], b: number[]): number => {
  if (a.length !== b.length) {
    throw new Error("Arrays must have the same length");
  }
  return Math.sqrt(a.reduce((sum, _, i) => sum + Math.pow(a[i] - b[i], 2), 0));
};

export const normalizeDescriptor = (descriptor: number[]): number[] => {
  const magnitude = Math.sqrt(
    descriptor.reduce((sum, val) => sum + val * val, 0)
  );
  return descriptor.map((val) => val / magnitude);
};

export const findUserByFaceDescriptor = async (
  faceDescriptor: number[]
): Promise<{ user: any; distance: number } | null> => {
  const normalizedInput = normalizeDescriptor(faceDescriptor);
  const users = await userModel.find({});
  let bestMatch = null;
  let bestDistance = Infinity;

  for (const user of users) {
    if (!user.faceDescriptor || user.faceDescriptor.length !== 128) {
      console.log(`User ${user.email} has no valid face descriptor`);
      continue;
    }

    const normalizedStored = normalizeDescriptor(user.faceDescriptor);
    const distance = euclideanDistance(normalizedInput, normalizedStored);

    console.log(`User: ${user.email}, Distance: ${distance.toFixed(4)}`);

    if (distance < FACE_MATCH_THRESHOLD && distance < bestDistance) {
      bestMatch = user;
      bestDistance = distance;
    }
  }

  if (bestMatch) {
    return { user: bestMatch, distance: bestDistance };
  } else {
    console.log("No matching user found");
    return null;
  }
};
