/**
 * Copyright 2021 Lightbend Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as as from "@lightbend/akkaserverless-javascript-sdk";

/**
 * The PersonEntity uses the ValueEntity state model in Akka Serverless.
 * This function creates a new Value Entity state model for the contact entity.
 */
export const PersonEntity = new as.ValueEntity(
  ["./proto/domain.proto"],
  "com.coreyauger.akkaserverless.typescript.PersonService",
  "contact",
  {
    // A snapshot will be persisted every time this many events are emitted.
    snapshotEvery: 100,

    // The directories to include when looking up imported protobuf files.
    includeDirs: ["./"],

    // Whether serialization of primitives should be supported when serializing events
    // and snapshots.
    serializeAllowPrimitives: true,

    // Whether serialization should fallback to using JSON if the state can't be serialized
    // as a protobuf.
    serializeFallbackToJson: true,
  }
);

/**
 * Create types to work with events
 */
const details = PersonEntity.lookupType(
  "com.coreyauger.akkaserverless.typescript.PersonDetails"
);

/**
 * Set a callback to create the initial state. This is what is created if there is no snapshot
 * to load, in other words when the entity is created and nothing else exists for it yet.
 */
PersonEntity.setInitial((personID) => details.create({ id: personID }));

/**
 * Set a callback to create the behavior given the current state. Since there is no state
 * machine like behavior transitions for this entity, we just return one behavior, but
 * you could return multiple different behaviors depending on the state.
 */
PersonEntity.commandHandlers = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  AddPersonDetails: addPersonDetails,
};

/**
 * addPersonDetails is the entry point for the API to handle requests. In this case, the
 * code makes sure the person ID is always set to the entity ID so it can't be overwritten.
 * The state is an empty place holder.
 *
 * @param {*} personDetails The details of the person, coming from the request
 * @param {*} state An empty placeholder
 * @param {*} ctx The context object for Akka Serverless
 * @return {*} returns an empty message
 */
function addPersonDetails(personDetails, state, ctx) {
  personDetails.id = ctx.entityId;
  ctx.updateState(details.create(personDetails));
  return {};
}
