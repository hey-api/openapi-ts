/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

// import * as core from '@actions/core'
// import * as main from '../src/main'

// // Mock the action's main function
// const runMock = jest.spyOn(main, 'run')

// // Other utilities
// const timeRegex = /^\d{2}:\d{2}:\d{2}/

// // Mock the GitHub Actions core library
// let debugMock: jest.SpiedFunction<typeof core.debug>
// let errorMock: jest.SpiedFunction<typeof core.error>
// let getInputMock: jest.SpiedFunction<typeof core.getInput>
// let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
// let setOutputMock: jest.SpiedFunction<typeof core.setOutput>

// describe('action', () => {
//   beforeEach(() => {
//     jest.clearAllMocks()

//     debugMock = jest.spyOn(core, 'debug').mockImplementation()
//     errorMock = jest.spyOn(core, 'error').mockImplementation()
//     getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
//     setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
//     setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
//   })

//   it('sets the time output', async () => {
//     // Set the action's inputs as return values from core.getInput()
//     getInputMock.mockImplementation(name => {
//       switch (name) {
//         case 'milliseconds':
//           return '500'
//         default:
//           return ''
//       }
//     })

//     await main.run()
//     expect(runMock).toHaveReturned()

//     // Verify that all of the core library functions were called correctly
//     expect(debugMock).toHaveBeenNthCalledWith(1, 'Waiting 500 milliseconds ...')
//     expect(debugMock).toHaveBeenNthCalledWith(
//       2,
//       expect.stringMatching(timeRegex)
//     )
//     expect(debugMock).toHaveBeenNthCalledWith(
//       3,
//       expect.stringMatching(timeRegex)
//     )
//     expect(setOutputMock).toHaveBeenNthCalledWith(
//       1,
//       'time',
//       expect.stringMatching(timeRegex)
//     )
//     expect(errorMock).not.toHaveBeenCalled()
//   })

//   it('sets a failed status', async () => {
//     // Set the action's inputs as return values from core.getInput()
//     getInputMock.mockImplementation(name => {
//       switch (name) {
//         case 'milliseconds':
//           return 'this is not a number'
//         default:
//           return ''
//       }
//     })

//     await main.run()
//     expect(runMock).toHaveReturned()

//     // Verify that all of the core library functions were called correctly
//     expect(setFailedMock).toHaveBeenNthCalledWith(
//       1,
//       'milliseconds not a number'
//     )
//     expect(errorMock).not.toHaveBeenCalled()
//   })
// })
