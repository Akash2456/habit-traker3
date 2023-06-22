const cron = require('node-cron');
const Habits = require('../../models/habits');
const Status = require('../../models/status');

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

(async () => {
  try {
    let currentDate = new Date();
    const month = monthNames[currentDate.getMonth()];
    const day = currentDate.getDate();
    const formattedDate = `${month} ${day}`;

    let dateToRemove = new Date();
    dateToRemove.setDate(dateToRemove.getDate() - 7);
    const RemoveMonth = monthNames[dateToRemove.getMonth()];
    const RemoveDay = dateToRemove.getDate();
    const RemoveDate = `${RemoveMonth} ${RemoveDay}`;

    let habits = await Habits.find({});

    for (let habit of habits) {
      let status = await Status.findOne({ date: RemoveDate, habit: habit._id });

      if (status) {
        let dateID = status._id;

        await Status.deleteOne({ _id: dateID });

        await Habits.findByIdAndUpdate(habit._id, { $pull: { status: dateID } });
      }

      let newStatus = await Status.create({
        date: formattedDate,
        datestatus: 'Not Started',
        habit: habit._id
      });

      habit.status.push(newStatus._id);
      await habit.save();
    }
  } catch (error) {
    console.log('Error', error);
  }
})();


